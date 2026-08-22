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
      className={`bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 select-none transition-[width] duration-200 ease-out overflow-hidden ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header Section (Single Toggle Button) */}
      <div className="p-3 flex items-center justify-between border-b border-slate-900 min-h-[56px] overflow-hidden">
        {!isSidebarCollapsed ? (
          <>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2 whitespace-nowrap overflow-hidden">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>DANH MỤC NGHIỆP VỤ</span>
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Thu gọn thanh bên"
              title="Thu gọn thanh bên"
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Mở rộng thanh điều hướng"
            title="Mở rộng thanh điều hướng"
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="p-2.5 flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`w-full flex items-center gap-3 rounded-2xl transition-all duration-150 relative cursor-pointer overflow-hidden ${
                    isSidebarCollapsed ? 'p-2 justify-center' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90 font-medium'
                  }`}
                >
                  {/* Active Indicator bar */}
                  {isActive && !isSidebarCollapsed && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-white rounded-r-full shadow-xs" />
                  )}

                  {/* Fixed-size Icon Container (Always perfectly centered and sized) */}
                  <div
                    className={`w-9 h-9 rounded-xl transition-colors shrink-0 flex items-center justify-center ${
                      isActive
                        ? 'bg-emerald-700/80 text-white'
                        : 'bg-slate-900 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Smooth Sliding Text Container */}
                  <div
                    className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-out text-left ${
                      isSidebarCollapsed
                        ? 'max-w-0 opacity-0 pointer-events-none'
                        : 'max-w-[180px] opacity-100 flex-1'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] tracking-tight font-bold">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1.5 ${
                            isActive
                              ? 'bg-emerald-800/90 text-emerald-100'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs truncate mt-0.5 ${
                        isActive ? 'text-emerald-100/90 font-medium' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </button>

                {/* Floating Tooltip when Collapsed */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700/90 whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md font-mono">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Card */}
      <div className="p-3.5 border-t border-slate-900 bg-slate-950 text-xs text-slate-400 overflow-hidden">
        {!isSidebarCollapsed ? (
          <div className="space-y-1 whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>QLNN v1.0.0 (Bảo Mật SSO)</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Hệ sinh thái Số Đăk Hà • AES-256</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
