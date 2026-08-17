import React, { useState } from 'react';
import { Sprout, LogOut, User as UserIcon, Shield, MapPin, Wifi, WifiOff, Activity } from 'lucide-react';
import { useApp } from '../../AppContext';
import { ServerStatusModal } from '../network/ServerStatusModal';

export const Header: React.FC = () => {
  const { user, logout, isOnline, isBackendHealthy, latency, selectedVillageName } = useApp();
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500/20">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900 tracking-tight">
                QUẢN LÝ NÔNG NGHIỆP & NTM
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100/80 text-emerald-800 rounded-full border border-emerald-300 uppercase tracking-wider">
                XÃ ĐĂK HÀ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              Hệ sinh thái Dữ liệu Số hóa Đăk Hà (Đồng bộ SSO Gateway)
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3.5">
          {/* Village Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold border border-slate-200 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : !isOnline
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 animate-pulse'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isOnline && isBackendHealthy ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-[11px]">{latency !== null ? `${latency}ms` : 'Online'}</span>
              </>
            ) : !isOnline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span>Ngoại tuyến</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Thử lại...</span>
              </>
            )}
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* User Info & Role Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs shadow-xs">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-800 leading-snug">{user?.username || 'Cán bộ'}</div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  {user?.role === 'admin' ? 'Cán bộ Xã (Admin)' : 'Trưởng Thôn'}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95 cursor-pointer"
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
