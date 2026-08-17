import React from 'react';
import {
  Users,
  BarChart3,
  Map,
  FileSpreadsheet,
  ShieldCheck,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useApp } from '../../AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user, isSidebarCollapsed, toggleSidebar } = useApp();

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
    <aside
      className={`bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header Section */}
      <div className="p-3 flex items-center justify-between border-b border-slate-900 min-h-[52px]">
        {!isSidebarCollapsed ? (
          <>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>DANH MỤC NGHIỆP VỤ</span>
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              title="Thu gọn thanh bên (Mở rộng không gian làm việc)"
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Mở rộng thanh điều hướng"
            className="w-full flex items-center justify-center p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="p-2.5 flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center rounded-2xl transition-all relative cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center p-3' : 'items-start gap-3 px-3.5 py-3 text-left'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold shadow-lg shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90 font-medium'
                  }`}
                >
                  {/* Active Indicator bar */}
                  {isActive && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1.5 bg-emerald-300 rounded-r-full shadow-sm ${
                        isSidebarCollapsed ? 'top-1.5 bottom-1.5' : ''
                      }`}
                    />
                  )}

                  <div
                    className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/30 text-white'
                        : 'bg-slate-900 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isSidebarCollapsed && (
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
                          isActive
                            ? 'text-emerald-100/80 font-normal'
                            : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </div>
                    </div>
                  )}
                </button>

                {/* Floating Tooltip when Collapsed */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                    <div className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-md font-mono">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.desc}</div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Card */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60 text-[11px] text-slate-500">
        {!isSidebarCollapsed ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>QLNN v1.0.0 (Bảo Mật SSO)</span>
            </div>
            <p className="text-[10px] text-slate-500">Hệ sinh thái Số Đăk Hà • AES-256</p>
          </div>
        ) : (
          <div className="flex justify-center" title="Bảo mật SSO • AES-256">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
