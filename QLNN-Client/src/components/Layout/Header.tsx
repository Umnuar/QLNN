import React from 'react';
import { Sprout, LogOut, User as UserIcon, Shield, MapPin, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../AppContext';

export const Header: React.FC = () => {
  const { user, logout, isOnline, selectedVillageName } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              QUẢN LÝ NÔNG NGHIỆP & NÔNG THÔN MỚI
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              XÃ ĐĂK HÀ
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Hệ sinh thái Dữ liệu Số hóa Đăk Hà (Đồng bộ SSO)
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Village Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 text-xs font-medium border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{selectedVillageName || (user?.role === 'admin' ? 'Toàn xã' : 'Chưa chọn thôn')}</span>
        </div>

        {/* Network Status */}
        <div className="flex items-center gap-1 text-xs">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Wifi className="w-4 h-4" /> Trực tuyến
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <WifiOff className="w-4 h-4" /> Ngoại tuyến
            </span>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Info & Role Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">{user?.username || 'Cán bộ'}</div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Shield className="w-3 h-3 text-emerald-600" />
                {user?.role === 'admin' ? 'Cán bộ Xã' : 'Trưởng Thôn'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Đăng xuất khỏi hệ thống"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
