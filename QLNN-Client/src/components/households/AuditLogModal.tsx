import React from 'react';
import { History, X } from 'lucide-react';
import { AuditLogView } from '../audit/AuditLogView';

interface AuditLogModalProps {
  villageId: string;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ villageId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden scale-100 transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Nhật Ký Sửa Đổi Thôn</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Lịch sử các sự kiện cập nhật, thêm mới và xóa dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
          <AuditLogView villageId={villageId} showFilters={true} />
        </div>
      </div>
    </div>
  );
};

