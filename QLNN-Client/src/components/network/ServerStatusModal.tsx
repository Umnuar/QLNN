import React from 'react';
import { X, Server, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../AppContext';

interface ServerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  latency: number | null;
  isBackendHealthy: boolean;
}

export const ServerStatusModal: React.FC<ServerStatusModalProps> = ({
  isOpen,
  onClose,
  latency,
  isBackendHealthy,
}) => {
  const { user, isOnline } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">Chẩn Đoán Kết Nối Hệ Thống</h3>
              <p className="text-[11px] text-slate-300">Hạ tầng Dữ liệu Nông nghiệp Đăk Hà</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600 dark:text-slate-300">Trạng thái mạng máy trạm:</span>
              {isOnline ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Có kết nối Internet
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rớt mạng / Offline
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600 dark:text-slate-300">Máy chủ QLNN (Port 5001):</span>
              {isBackendHealthy ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động bình thường
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" /> Mất phản hồi / Đang thử lại
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600 dark:text-slate-300">Độ trễ phản hồi (Latency):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {latency !== null ? `${latency} ms` : 'Đang đo...'}
              </span>
            </div>
          </div>

          {/* Current Session */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <div>
                <div className="font-bold">{user?.username || 'Cán bộ'}</div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Mã hóa AES • Session Timeout 30 phút</div>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold rounded-md text-[10px] uppercase">
              {user?.role === 'admin' ? 'Admin Toàn Xã' : 'Trưởng Thôn'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
