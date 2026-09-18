import React from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ConnectionBannerProps {
  isOffline: boolean;
  isReconnected: boolean;
  onRetry: () => void;
  isRetrying: boolean;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  isOffline,
  isReconnected,
  onRetry,
  isRetrying,
}) => {
  if (isReconnected) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-in slide-in-from-top duration-300">
        <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
        <span>Đã khôi phục kết nối thành công — Dữ liệu đã được đồng bộ tự động thời gian thực!</span>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200 animate-pulse" strokeWidth={1.5} />
          <span>
            <strong>Mất kết nối đến máy chủ Đăk Hà:</strong> Ứng dụng đang chuyển sang chế độ đọc bộ nhớ đệm và tự động kết nối lại...
          </span>
        </div>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold rounded-2xl text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          <span>{isRetrying ? 'Đang thử lại...' : 'Thử kết nối ngay'}</span>
        </button>
      </div>
    );
  }

  return null;
};
