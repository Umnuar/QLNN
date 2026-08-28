import React, { useState } from 'react';
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
