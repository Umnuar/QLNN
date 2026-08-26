import React from 'react';
import { Database, Download, UploadCloud, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BackupRestoreTab: React.FC = () => {
  const handleAction = () => {
    alert('Chức năng đang được cập nhật ở Backend');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-3xl space-y-6">
        {/* Header Title */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Sao lưu & Khôi phục Dữ liệu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Quản lý xuất bản sao lưu toàn bộ cơ sở dữ liệu hệ thống hoặc khôi phục dữ liệu từ bản lưu trữ.
            </p>
          </div>
        </div>

        {/* Export Section */}
        <div className="p-5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Tải xuống Bản sao lưu (Export Database)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tải về toàn bộ cơ sở dữ liệu hệ thống (JSON/SQLite) gồm danh sách hộ nông nghiệp, chỉ tiêu NTM, phân quyền tài khoản và nhật ký hoạt động để lưu trữ an toàn hoặc chuyển đổi thiết bị.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={handleAction}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Database (.sqlite / .json)</span>
            </button>
          </div>
        </div>

        {/* Restore Section */}
        <div className="p-5 border border-rose-200 dark:border-rose-900/60 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300">
                  Khôi phục Dữ liệu Hệ thống (Restore Database)
                </h4>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-3 h-3" /> Cảnh báo
                </span>
              </div>
              <p className="text-xs text-rose-600/90 dark:text-rose-300/80 mt-1 leading-relaxed">
                Lưu ý: Hành động này sẽ ghi đè toàn bộ dữ liệu hiện tại trên hệ thống bằng nội dung từ tệp sao lưu. Vui lòng đảm bảo bạn đã tạo bản sao lưu dự phòng trước khi tiến hành.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={handleAction}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Nhập Database (.sqlite / .json)</span>
            </button>
          </div>
        </div>

        {/* System Storage Note */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>Dữ liệu được lưu trữ cục bộ an toàn theo cơ chế mã hóa AES & SQLite engine.</span>
        </div>
      </div>
    </div>
  );
};
