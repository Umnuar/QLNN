import React from 'react';
import { Users, BarChart3, Map, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const navItems = [
    {
      id: 'households',
      label: 'Hộ Nông Nghiệp',
      icon: Users,
      desc: 'Quản lý 18 chỉ số hộ dân',
    },
    {
      id: 'analytics',
      label: 'Thống Kê NTM',
      icon: BarChart3,
      desc: 'Chỉ tiêu nông thôn mới',
    },
    {
      id: 'excel',
      label: 'Nhập / Xuất Excel',
      icon: FileSpreadsheet,
      desc: 'Smart Upsert 21 cột',
    },
    ...(user?.role === 'admin'
      ? [
          {
            id: 'villages',
            label: 'Danh Mục Thôn',
            icon: Map,
            desc: 'Danh sách các thôn trong xã',
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      <div className="p-4 flex-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
          CHỨC NĂNG CHÍNH
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="text-sm leading-snug">{item.label}</div>
                  <div className={`text-[11px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-400">QLNN v1.0.0 (Bảo mật SSO)</div>
        <div>Hệ sinh thái Số Đăk Hà</div>
      </div>
    </aside>
  );
};
