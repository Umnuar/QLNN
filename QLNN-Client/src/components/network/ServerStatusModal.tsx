import React from 'react';
import { Server, CheckCircle2, AlertCircle, X, Activity } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
            <Server className="w-5 h-5 text-slate-500" />
            <span>Trạng Thái Máy Chủ</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isBackendHealthy ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}>
                {isBackendHealthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Kết Nối
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBackendHealthy ? 'Hoạt động ổn định' : 'Mất kết nối'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Độ Trễ (Ping)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {latency !== null ? `${latency} ms` : 'Đang đo...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
