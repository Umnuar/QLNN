import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileSpreadsheet, UploadCloud, DownloadCloud, AlertCircle, ShieldCheck, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../AppContext';
import { excelApi } from '../api/excelApi';
import { householdApi } from '../api/householdApi';
import { useModal } from '../hooks/useModal';
import { HouseholdTable } from '../components/households/HouseholdTable';
import { HouseholdFlat } from '../types';

export const ExcelPage: React.FC = () => {
  const { user, selectedVillageId, selectedVillageName } = useApp();
  const { showModal } = useModal();

  // Export State
  const [exporting, setExporting] = useState(false);

  // Preview State
  const [previewMode, setPreviewMode] = useState<'import' | 'export' | null>(null);
  
  // Import Logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Export Logic (for Preview)
  const [exportData, setExportData] = useState<HouseholdFlat[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportPage, setExportPage] = useState(1);
  const [exportLimit, setExportLimit] = useState(20);
  const [exportTotal, setExportTotal] = useState(0);
  const [exportTotalPages, setExportTotalPages] = useState(1);

  // -- IMPORT PREVIEW LOGIC --
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      showModal({
        title: 'File không hợp lệ',
        message: 'Chỉ chấp nhận file Excel định dạng .xls hoặc .xlsx',
        type: 'danger',
      });
      return;
    }

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Read as 2D array
        const rawData = XLSX.utils.sheet_to_json<any[][]>(ws, { header: 1 });
        
        // Skip first 9 rows (headers), then filter rows that have a full_name (usually index 1)
        const parsedRows = rawData.slice(9).filter(row => row[1] && typeof row[1] === 'string' && (row[1] as string).trim() !== '');
        
        setImportData(parsedRows);
        setPreviewMode('import');
      } catch (err) {
        console.error('Error parsing excel:', err);
        showModal({
          title: 'Lỗi đọc file',
          message: 'Không thể đọc nội dung file Excel. Vui lòng kiểm tra lại biểu mẫu.',
          type: 'danger',
        });
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    
    if (user?.role === 'admin' && !selectedVillageId) {
      showModal({
        title: 'Lỗi',
        message: 'Vui lòng chọn Thôn cần nhập dữ liệu từ menu góc phải.',
        type: 'danger'
      });
      return;
    }
    
    setImporting(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const res = await excelApi.importExcel(importFile, targetVillage);
      
      showModal({
        title: 'Nhập dữ liệu thành công',
        message: `Đã xử lý ${res.totalRowsParsed} hộ:\n• Thêm mới: ${res.createdCount} hộ\n• Cập nhật: ${res.updatedCount} hộ.`,
        type: 'info',
        confirmText: 'Hoàn Tất',
        onConfirm: () => {
          setPreviewMode(null);
          setImportFile(null);
          setImportData([]);
        }
      });
    } catch (err: any) {
      console.error('Import error:', err);
      showModal({
        title: 'Lỗi Nhập Excel',
        message: err.response?.data?.error || err.response?.data?.message || 'Không thể nhập file Excel. Vui lòng kiểm tra lại dữ liệu.',
        type: 'danger',
      });
    } finally {
      setImporting(false);
    }
  };

  // -- EXPORT PREVIEW LOGIC --
  const fetchExportPreview = useCallback(async () => {
    if (previewMode !== 'export') return;
    setExportLoading(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const res = await householdApi.getPage({
        villageId: targetVillage,
        page: exportPage,
        limit: exportLimit,
      });
      setExportData(res.data);
      setExportTotal(res.pagination.total);
      setExportTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Fetch export preview error:', err);
    } finally {
      setExportLoading(false);
    }
  }, [previewMode, selectedVillageId, exportPage, exportLimit, user?.role]);

  useEffect(() => {
    fetchExportPreview();
  }, [fetchExportPreview]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const blob = await excelApi.exportExcel(targetVillage);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Thong_ke_nong_nghiep_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Export error:', err);
      showModal({
        title: 'Lỗi Xuất File Excel',
        message: err.response?.data?.error || 'Không thể xuất file Excel. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleOpenExportPreview = () => {
    setExportPage(1);
    setPreviewMode('export');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Nhập / Xuất Dữ Liệu Excel</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Kiểm tra dữ liệu trước khi nhập và tự động cập nhật để tránh trùng lặp
          </p>
        </div>

        {/* Admin Village Selector */}
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Box */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-150 relative overflow-hidden">
          {previewMode === 'import' && (
            <div className="absolute inset-0 bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/50 rounded-3xl pointer-events-none z-10" />
          )}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Nhập File Excel Thống Kê</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Áp dụng cho {selectedVillageName || 'thôn đã chọn'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Chọn file Excel theo biểu mẫu quy định. Hệ thống sẽ tự động bỏ qua 9 dòng tiêu đề, lọc các dòng hợp lệ và hiển thị bảng xem trước ở bên dưới.
            </p>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 text-xs flex items-start gap-2.5 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Chỉ những dòng có điền họ tên thật mới được nhập vào hệ thống. Các dòng trống bên dưới sẽ tự động bị loại trừ (chống hộ ma).</span>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            accept=".xls,.xlsx"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-full px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer relative z-20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Chọn file Excel tải lên...</span>
          </button>
        </div>

        {/* Export Box */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-150 relative overflow-hidden">
          {previewMode === 'export' && (
            <div className="absolute inset-0 bg-sky-50/50 dark:bg-sky-950/20 border-2 border-sky-500/50 rounded-3xl pointer-events-none z-10" />
          )}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <DownloadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Xuất file Excel</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Xuất dữ liệu ra file Excel theo biểu mẫu báo cáo.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Xuất toàn bộ danh sách hộ dân và 18 chỉ số ra file Excel với đầy đủ 3 dòng tiêu đề, ô gộp, công thức hàm SUM và phần ký duyệt Ban quản lý thôn.
            </p>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 text-xs flex items-start gap-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Dữ liệu xuất ra tương thích 100% với Microsoft Excel, LibreOffice và Google Sheets.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-20">
            <button
              type="button"
              onClick={handleOpenExportPreview}
              className="h-11 flex-1 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.99] text-slate-700 dark:text-slate-200 font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>Xem trước xuất</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="h-11 flex-1 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{exporting ? 'Đang tạo...' : 'Tải Xuống'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- PREVIEW AREA --- */}
      {previewMode && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col transition-colors duration-150 animate-in slide-in-from-bottom-4 overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${previewMode === 'import' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400'}`}>
                {previewMode === 'import' ? <UploadCloud className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-sm">
                  {previewMode === 'import' ? 'Preview Dữ Liệu Sắp Nhập' : 'Preview Dữ Liệu Sắp Xuất'}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {previewMode === 'import' 
                    ? `Từ file: ${importFile?.name} (${importData.length} hộ hợp lệ)` 
                    : `Toàn bộ hộ nông nghiệp của ${selectedVillageName || 'tất cả các thôn'}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewMode(null)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Đóng Preview
            </button>
          </div>

          <div className="p-4">
            {previewMode === 'export' && (
              <HouseholdTable
                readOnly={true}
                households={exportData}
                loading={exportLoading}
                total={exportTotal}
                page={exportPage}
                limit={exportLimit}
                totalPages={exportTotalPages}
                onPageChange={setExportPage}
                onLimitChange={setExportLimit}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}

            {previewMode === 'import' && (
              <div className="flex flex-col gap-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[500px] overflow-auto">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold z-10 shadow-sm">
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
                      {importData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-2 px-3 font-mono text-slate-500">{row[0] || idx + 1}</td>
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
                      {importData.length === 0 && (
                        <tr>
                          <td colSpan={20} className="py-8 text-center text-slate-500">
                            Không tìm thấy dữ liệu hợp lệ trong file
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(null)}
                    className="h-10 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={importing || importData.length === 0}
                    className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Xác Nhận Nhập Dữ Liệu</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
