import React, { useState } from 'react';
import {
  Sprout,
  LogOut,
  User as UserIcon,
  Shield,
  MapPin,
  Wifi,
  WifiOff,
  Activity,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  PanelLeftOpen,
} from 'lucide-react';
import { useApp } from '../../AppContext';
import { ServerStatusModal } from '../network/ServerStatusModal';

export const Header: React.FC = () => {
  const {
    user,
    logout,
    isOnline,
    isBackendHealthy,
    latency,
    selectedVillageName,
    isSidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useApp();

  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none transition-colors duration-200">
        {/* Left: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3">
          {/* Quick Open Sidebar Button (when collapsed) */}
          {isSidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Mở rộng thanh điều hướng bên trái"
              className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500/20 shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                QUẢN LÝ NÔNG NGHIỆP & NTM
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100/80 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700 uppercase tracking-wider hidden sm:inline-block">
                XÃ ĐĂK HÀ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5 hidden sm:block">
              Hệ sinh thái Dữ liệu Số hóa Đăk Hà (Đồng bộ SSO Gateway)
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Zoom Controls Pill */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoomLevel <= 80}
              title="Thu nhỏ giao diện (Ctrl -)"
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={resetZoom}
              title="Bấm để đặt lại kích thước 100% (Ctrl 0)"
              className="px-2 py-1 font-mono font-bold text-[11px] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {zoomLevel}%
            </button>

            <button
              type="button"
              onClick={zoomIn}
              disabled={zoomLevel >= 140}
              title="Phóng to giao diện (Ctrl +)"
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dark / Light Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối (Đen Trắng)'}
            className="p-2 text-slate-600 hover:text-amber-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0" />
            )}
          </button>

          {/* Village Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="max-w-[140px] truncate">
              {selectedVillageName || (user?.role === 'admin' ? 'Toàn xã Đăk Hà' : 'Chưa chọn thôn')}
            </span>
          </div>

          {/* Network / Latency Pill (Clickable for Diagnostics) */}
          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            title="Bấm để xem chẩn đoán kết nối máy chủ"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isOnline && isBackendHealthy
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                : !isOnline
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 animate-pulse'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            {isOnline && isBackendHealthy ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-mono text-[11px]">{latency !== null ? `${latency}ms` : 'Online'}</span>
              </>
            ) : !isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="hidden sm:inline">Ngoại tuyến</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
                <span className="hidden sm:inline">Thử lại...</span>
              </>
            )}
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* User Info & Role Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 leading-snug">
                  {user?.username || 'Cán bộ'}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {user?.role === 'admin' ? 'Cán bộ Xã (Admin)' : 'Trưởng Thôn'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <ServerStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        latency={latency}
        isBackendHealthy={isBackendHealthy}
      />
    </>
  );
};
