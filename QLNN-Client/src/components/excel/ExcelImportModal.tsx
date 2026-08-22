import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { excelApi, ExcelPreviewResponse } from '../../api/excelApi';
import { useApp } from '../../AppContext';
import { useModal } from '../../hooks/useModal';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, villages } = useApp();
  const { showModal } = useModal();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [villageId, setVillageId] = useState<string>(
    user?.role === 'user' && user.village_id ? user.village_id : villages[0]?.id || ''
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewResponse | null>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (file: File) => {
    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      setError('Chỉ chấp nhận file Excel định dạng .xls hoặc .xlsx');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setPreviewData(null);
    setPreviewLoading(true);

    try {
      const targetVillage = user?.role === 'admin' ? villageId : undefined;
      const res = await excelApi.previewExcel(file, targetVillage);
      setPreviewData(res);
    } catch (err: any) {
      console.error('Preview error:', err);
      const msg =
        err.response?.data?.error ||
        'Không thể đọc cấu trúc file Excel. Vui lòng kiểm tra định dạng 21 cột.';
      setError(msg);
      setSelectedFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleExecuteImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setError(null);

    try {
      const targetVillage = user?.role === 'admin' ? villageId : undefined;
      const res = await excelApi.importExcel(selectedFile, targetVillage);

      showModal({
        title: 'Nhập Dữ Liệu Thành Công!',
        message: `Đã xử lý thành công ${res.totalRowsParsed} hộ:\n• Tạo mới: ${res.createdCount} hộ\n• Cập nhật đè (Smart Upsert): ${res.updatedCount} hộ.`,
        type: 'info',
        confirmText: 'Hoàn Tất',
        onConfirm: () => {
          onSuccess();
          onClose();
        },
      });
    } catch (err: any) {
      console.error('Import error:', err);
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi nhập dữ liệu Excel vào hệ thống.';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-150">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                Nhập Dữ Liệu Excel (Smart Upsert 21 Cột)
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Tự động đối chiếu chống trùng lặp và loại bỏ dòng rác (Chống hộ ma)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Village Selector */}
          {user?.role === 'admin' && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Thôn tiếp nhận dữ liệu:</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Chọn thôn sẽ gán các hộ mới được import vào
                </p>
              </div>
              <select
                value={villageId}
                onChange={(e) => {
                  setVillageId(e.target.value);
                  if (selectedFile) handleFileSelected(selectedFile);
                }}
                className="h-9 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/60 dark:hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1">
              {selectedFile ? selectedFile.name : 'Kéo thả file Excel vào đây hoặc bấm để chọn file'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
              Hỗ trợ định dạng .xls và .xlsx theo biểu mẫu thống kê cây trồng, vật nuôi, thủy sản xã Đăk Hà
            </p>
          </div>

          {/* Preview Loading */}
          {previewLoading && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              <RefreshCw className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <span className="font-bold">Đang phân tích cấu trúc file và đối chiếu Smart Upsert...</span>
            </div>
          )}

          {/* Preview Results */}
          {previewData && !previewLoading && (
            <div className="space-y-4">
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Tổng hộ hợp lệ
                  </div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono tabular-nums">
                    {previewData.totalRowsParsed}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
                  <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sẽ tạo mới</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                    {previewData.createCount}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl">
                  <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sẽ cập nhật đè</span>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                    {previewData.updateCount}
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                  <span>Danh sách xem trước ({previewData.previewList.length} hộ đầu tiên):</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold hover:underline cursor-pointer"
                  >
                    Chọn file khác
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3 text-center">Hành động</th>
                        <th className="py-2.5 px-3 text-right">Tổng cây</th>
                        <th className="py-2.5 px-3 text-right">Vật nuôi</th>
                        <th className="py-2.5 px-3 text-right">Thủy sản</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                      {previewData.previewList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{item.full_name}</td>
                          <td className="py-2.5 px-3 text-center">
                            {item.action === 'create' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Tạo mới
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Cập nhật đè
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                            {item.cropCount} cây
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                            {item.livestockCount} nuôi
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                            {item.aquaCount} thủy sản
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Dòng không có họ tên hoặc số liệu tổng cộng sẽ tự động bị bỏ qua.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!previewData || importing || previewData.totalRowsParsed === 0}
              className="h-10 flex items-center gap-1.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {importing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Nhập Dữ Liệu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
