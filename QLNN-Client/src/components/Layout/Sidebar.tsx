import React from 'react';
import { Users, BarChart3, Map, FileSpreadsheet, ShieldCheck, Database } from 'lucide-react';
import { useApp } from '../../AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const navItems = [
    {
      id: 'households',
      label: 'Hộ Nông Nghiệp',
      icon: Users,
      desc: 'Quản lý 18 chỉ số hộ dân',
      badge: 'Chính',
    },
    {
      id: 'analytics',
      label: 'Thống Kê NTM',
      icon: BarChart3,
      desc: '25 chỉ tiêu nông thôn mới',
      badge: 'Live',
    },
    {
      id: 'excel',
      label: 'Nhập / Xuất Excel',
      icon: FileSpreadsheet,
      desc: 'Smart Upsert 21 cột ma trận',
    },
    ...(user?.role === 'admin'
      ? [
          {
            id: 'villages',
            label: 'Danh Mục Thôn',
            icon: Map,
            desc: '7 thôn chuẩn hóa xã Đăk Hà',
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none">
      <div className="p-4 flex-1">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-3 flex items-center justify-between">
          <span>DANH MỤC NGHIỆP VỤ</span>
          <Database className="w-3 h-3 text-slate-600" />
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 px-3.5 py-3 rounded-2xl text-left transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold shadow-lg shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90 font-medium'
                }`}
              >
                {/* Active Indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-emerald-300 rounded-r-full shadow-sm" />
                )}

                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-emerald-500/30 text-white' : 'bg-slate-900 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-tight font-black">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-800/80 text-emerald-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isActive ? 'text-emerald-100/80 font-normal' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Card */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60 text-[11px] text-slate-500 space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>QLNN v1.0.0 (Bảo Mật SSO)</span>
        </div>
        <p className="text-[10px] text-slate-500">Hệ sinh thái Số Đăk Hà • Mã hóa AES-256</p>
      </div>
    </aside>
  );
};
