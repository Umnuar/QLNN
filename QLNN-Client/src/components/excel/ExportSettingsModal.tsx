import React, { useState } from 'react';
import { DownloadCloud, X } from 'lucide-react';

interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (scope: 'all' | 'selected') => void;
  exporting: boolean;
  isAdmin: boolean;
  selectedCount?: number;
}

export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen, onClose, onExport, exporting, isAdmin, selectedCount = 0
}) => {
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400 flex items-center justify-center">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white">Cài đặt Xuất Excel</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phạm vi xuất</label>
            <p className="text-xs text-slate-500">
              {isAdmin ? 'Đang xuất theo thôn đã chọn (hoặc toàn xã nếu chọn Tất cả).' : 'Đang xuất dữ liệu của thôn hiện tại.'}
            </p>
          </div>
          
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-start">
                <input
                  type="radio"
                  name="exportScope"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                  className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-sky-500 checked:border-[6px] transition-all"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Toàn bộ hộ trong phạm vi</p>
                <p className="text-xs text-slate-500">Xuất toàn bộ các hộ hiện thị.</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}>
              <div className="relative flex items-start">
                <input
                  type="radio"
                  name="exportScope"
                  disabled={selectedCount === 0}
                  checked={exportScope === 'selected'}
                  onChange={() => setExportScope('selected')}
                  className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-sky-500 checked:border-[6px] transition-all disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Chỉ xuất {selectedCount} hộ đã chọn</p>
                <p className="text-xs text-slate-500">Chỉ xuất các hộ đã được tích chọn trong bảng.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold rounded-xl text-xs transition-colors">
            Hủy
          </button>
          <button
            onClick={() => onExport(exportScope)}
            disabled={exporting}
            className="h-10 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? 'Đang tạo...' : 'Bắt đầu Xuất'}
          </button>
        </div>
      </div>
    </div>
  );
};
