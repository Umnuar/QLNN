import os
import re

client_src = r"C:\Projects\QLNN\QLNN-Client\src"
backend_src = r"C:\Projects\QLNN\QLNN-Backend\src"

# 1. Create ImportPreviewModal.tsx
import_modal_path = os.path.join(client_src, "components", "excel", "ImportPreviewModal.tsx")
os.makedirs(os.path.dirname(import_modal_path), exist_ok=True)
import_modal_code = """import React, { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  parsedData: any[];
  onConfirm: (file: File) => void;
  importing: boolean;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen, onClose, file, parsedData, onConfirm, importing
}) => {
  const [importPage, setImportPage] = useState(1);
  const [importLimit, setImportLimit] = useState(20);

  if (!isOpen || !file) return null;

  const displayData = parsedData.slice((importPage - 1) * importLimit, importPage * importLimit);
  const maxPage = Math.ceil(parsedData.length / importLimit) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white">Preview Dữ Liệu Sắp Nhập</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Từ file: {file.name} ({parsedData.length} hộ hợp lệ)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-auto flex-1">
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800">STT</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800">Họ và Tên</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Cà phê (Hộ)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Cà phê (Nhận k)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Cao su (Hộ)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Cao su (Nhận k)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Cây ăn quả</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Macca</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400">Đinh lăng</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400">Gừng</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400">Nghệ</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400">Sả</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Lúa nước</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400">Cây HN khác</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400">Bò (con)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400">Heo (con)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400">Gia cầm (con)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-400">Ao cá (ha)</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-400">Lồng bè</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 dark:border-slate-800">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {displayData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-500">{row[0] || (importPage - 1) * importLimit + idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{row[1]}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[2] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[3] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[4] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[5] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[6] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[7] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[8] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[9] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[10] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[11] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[12] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[13] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[14] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[15] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[16] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[17] || '-'}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{row[18] || '-'}</td>
                    <td className="py-2 px-3 text-slate-500">{row[19] || ''}</td>
                  </tr>
                ))}
                {displayData.length === 0 && (
                  <tr>
                    <td colSpan={20} className="py-8 text-center text-slate-500">
                      Không tìm thấy dữ liệu hợp lệ trong file
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Hiển thị</span>
            <select
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none"
              value={importLimit}
              onChange={(e) => {
                setImportLimit(Number(e.target.value));
                setImportPage(1);
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ {parsedData.length} bản ghi</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={importPage === 1}
                onClick={() => setImportPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {importPage} / {maxPage}
              </span>
              <button
                type="button"
                disabled={importPage >= maxPage}
                onClick={() => setImportPage(p => p + 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Sau
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            <div className="flex items-center gap-2">
              <button onClick={onClose} className="h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold rounded-xl text-xs transition-colors">
                Hủy Bỏ
              </button>
              <button
                onClick={() => onConfirm(file)}
                disabled={importing || parsedData.length === 0}
                className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {importing ? 'Đang xử lý...' : 'Xác Nhận Nhập Dữ Liệu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""
with open(import_modal_path, "w", encoding="utf-8") as f:
    f.write(import_modal_code)

# 2. Create ExportSettingsModal.tsx
export_modal_path = os.path.join(client_src, "components", "excel", "ExportSettingsModal.tsx")
export_modal_code = """import React, { useState } from 'react';
import { DownloadCloud, X } from 'lucide-react';

interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (excludeEmpty: boolean) => void;
  exporting: boolean;
  isAdmin: boolean;
}

export const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen, onClose, onExport, exporting, isAdmin
}) => {
  const [excludeEmpty, setExcludeEmpty] = useState(false);

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
          
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-start">
                <input
                  type="checkbox"
                  checked={excludeEmpty}
                  onChange={(e) => setExcludeEmpty(e.target.checked)}
                  className="peer w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-lg checked:border-sky-500 checked:bg-sky-500 transition-all"
                />
                <svg className="absolute inset-0 w-5 h-5 p-1 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 transition-colors">Loại bỏ hộ trống</p>
                <p className="text-xs text-slate-500">Chỉ xuất những hộ có dữ liệu cây trồng, vật nuôi hoặc thủy sản.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold rounded-xl text-xs transition-colors">
            Hủy
          </button>
          <button
            onClick={() => onExport(excludeEmpty)}
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
"""
with open(export_modal_path, "w", encoding="utf-8") as f:
    f.write(export_modal_code)

print("Created Modals")
